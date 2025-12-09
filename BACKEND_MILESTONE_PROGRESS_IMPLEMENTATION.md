# Milestone-Based Progress Tracking - Backend Implementation Guide

This document provides a complete guide for implementing the milestone-based progress tracking system on the backend.

## Overview

The system tracks PDF extraction progress and only returns responses at specific milestones (25%, 50%, 75%, 100%) instead of continuous updates. This reduces server load and provides a better user experience.

## Architecture

### ProgressTracker Service

A service class that tracks API call count per job and manages milestone logic.

### Milestones

The system uses 4 milestones:
- **25%** - First milestone
- **50%** - Second milestone  
- **75%** - Third milestone
- **100%** - Final milestone (completion)

## Implementation

### 1. ProgressTracker Service

```python
from typing import Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class MilestoneCheckResult:
    should_return: bool
    api_call_count: int
    milestone_reached: Optional[int] = None

class ProgressTracker:
    """
    Tracks API call count per job and manages milestone-based responses.
    """
    
    # Define milestones
    MILESTONES = [25, 50, 75, 100]
    
    def __init__(self):
        # Store job tracking data: {job_id: {'api_call_count': int, 'last_milestone': int}}
        self._job_tracking: Dict[str, Dict[str, int]] = {}
    
    def check_and_increment_api_call(
        self, 
        job_id: str, 
        current_progress: float
    ) -> MilestoneCheckResult:
        """
        Checks if current progress >= expected milestone for next API call.
        Only increments api_call_count when milestone is reached.
        
        Args:
            job_id: Unique identifier for the extraction job
            current_progress: Current progress percentage (0-100)
            
        Returns:
            MilestoneCheckResult with:
                - should_return: Whether to return progress data (milestone reached)
                - api_call_count: Current API call count for this job
                - milestone_reached: The milestone that was reached (if any)
        """
        # Initialize tracking for new jobs
        if job_id not in self._job_tracking:
            self._job_tracking[job_id] = {
                'api_call_count': 0,
                'last_milestone': 0
            }
        
        tracking = self._job_tracking[job_id]
        api_call_count = tracking['api_call_count']
        last_milestone = tracking['last_milestone']
        
        # Determine which milestone we're expecting next
        milestone_index = api_call_count
        if milestone_index >= len(self.MILESTONES):
            # All milestones reached, but job might still be processing
            # Check if progress is 100% (completed)
            if current_progress >= 100:
                return MilestoneCheckResult(
                    should_return=True,
                    api_call_count=api_call_count,
                    milestone_reached=100
                )
            # Not completed yet, don't return
            return MilestoneCheckResult(
                should_return=False,
                api_call_count=api_call_count,
                milestone_reached=None
            )
        
        expected_milestone = self.MILESTONES[milestone_index]
        
        # Check if current progress has reached the expected milestone
        if current_progress >= expected_milestone:
            # Milestone reached! Increment API call count
            tracking['api_call_count'] += 1
            tracking['last_milestone'] = expected_milestone
            
            return MilestoneCheckResult(
                should_return=True,
                api_call_count=tracking['api_call_count'],
                milestone_reached=expected_milestone
            )
        else:
            # Milestone not reached yet, don't increment or return
            return MilestoneCheckResult(
                should_return=False,
                api_call_count=api_call_count,
                milestone_reached=None
            )
    
    def get_api_call_count(self, job_id: str) -> int:
        """Get current API call count for a job."""
        if job_id not in self._job_tracking:
            return 0
        return self._job_tracking[job_id]['api_call_count']
    
    def cleanup_job(self, job_id: str):
        """Clean up tracking data for a completed/failed job."""
        if job_id in self._job_tracking:
            del self._job_tracking[job_id]
```

### 2. Progress Endpoint Implementation

```python
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import PlainTextResponse, Response
from typing import Optional

router = APIRouter()
progress_tracker = ProgressTracker()

@router.get("/extract/progress/{job_id}")
async def get_extraction_progress(job_id: str):
    """
    Get extraction progress for a job.
    
    Returns:
        - 200 JSON: When milestone reached (progress info)
        - 204 No Content: When milestone not reached (continue polling)
        - 200 PlainText: When completed (extracted content)
        - 400/500 JSON: When failed (error response)
    """
    try:
        # Get current progress from your extraction service/background task
        # This is a placeholder - replace with your actual progress retrieval
        current_progress = await get_job_progress(job_id)  # 0-100
        
        # Check job status
        job_status = await get_job_status(job_id)  # 'processing', 'completed', 'failed'
        
        # Handle completed status
        if job_status == 'completed':
            # Get extracted content
            extracted_content = await get_extracted_content(job_id)
            
            # Clean up tracking
            progress_tracker.cleanup_job(job_id)
            
            # Return plain text response with extracted content
            return PlainTextResponse(
                content=extracted_content,
                status_code=200,
                media_type="text/plain"
            )
        
        # Handle failed status
        if job_status == 'failed':
            error_message = await get_job_error(job_id)
            
            # Clean up tracking
            progress_tracker.cleanup_job(job_id)
            
            # Return JSON error response
            return JSONResponse(
                status_code=400,
                content={
                    "status": "failed",
                    "error": error_message,
                    "progress": current_progress,
                    "percentage": current_progress
                }
            )
        
        # Handle processing status - check milestone
        milestone_result = progress_tracker.check_and_increment_api_call(
            job_id=job_id,
            current_progress=current_progress
        )
        
        # If milestone reached, return progress info
        if milestone_result.should_return:
            return JSONResponse(
                status_code=200,
                content={
                    "status": "processing",
                    "progress": current_progress,
                    "percentage": current_progress,
                    "milestone": milestone_result.milestone_reached,
                    "api_call_count": milestone_result.api_call_count
                }
            )
        
        # Milestone not reached - return 204 No Content
        return Response(status_code=204)
        
    except JobNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )
    except Exception as e:
        # Log error
        logger.error(f"Error getting progress for job {job_id}: {str(e)}")
        
        # Clean up tracking on error
        progress_tracker.cleanup_job(job_id)
        
        raise HTTPException(
            status_code=500,
            detail={
                "status": "failed",
                "error": "Internal server error"
            }
        )
```

### 3. Integration with Background Task

```python
async def background_extraction_task(job_id: str, file_path: str):
    """
    Background task that performs PDF extraction.
    Updates progress as it processes.
    """
    try:
        # Initialize progress
        await update_job_progress(job_id, 0)
        await update_job_status(job_id, "processing")
        
        # Step 1: Parse PDF (0-25%)
        await parse_pdf(file_path)
        await update_job_progress(job_id, 25)
        
        # Step 2: Extract text (25-50%)
        text_content = await extract_text(file_path)
        await update_job_progress(job_id, 50)
        
        # Step 3: Process content (50-75%)
        processed_content = await process_content(text_content)
        await update_job_progress(job_id, 75)
        
        # Step 4: Finalize (75-100%)
        final_content = await finalize_extraction(processed_content)
        await update_job_progress(job_id, 100)
        
        # Save extracted content
        await save_extracted_content(job_id, final_content)
        await update_job_status(job_id, "completed")
        
    except Exception as e:
        await update_job_status(job_id, "failed")
        await save_job_error(job_id, str(e))
```

## Expected Behavior

### API Call Flow

1. **1st API call**: 
   - Progress: 0%
   - Milestone expected: 25%
   - Result: **204 No Content** (milestone not reached)

2. **2nd API call**:
   - Progress: 15%
   - Milestone expected: 25%
   - Result: **204 No Content** (milestone not reached)

3. **3rd API call**:
   - Progress: 30%
   - Milestone expected: 25%
   - Result: **200 JSON** with progress info (milestone reached!)
   - API call count: 1

4. **4th API call**:
   - Progress: 45%
   - Milestone expected: 50%
   - Result: **204 No Content** (milestone not reached)

5. **5th API call**:
   - Progress: 55%
   - Milestone expected: 50%
   - Result: **200 JSON** with progress info (milestone reached!)
   - API call count: 2

6. **6th API call**:
   - Progress: 80%
   - Milestone expected: 75%
   - Result: **200 JSON** with progress info (milestone reached!)
   - API call count: 3

7. **7th API call**:
   - Progress: 100%
   - Status: completed
   - Result: **200 PlainText** with extracted content
   - API call count: 4

## Benefits

1. **Reduced Server Load**: Only 4 meaningful responses instead of continuous updates
2. **Better Performance**: Less data transfer and processing
3. **Clear Progress Milestones**: Users see progress at meaningful points
4. **Efficient Polling**: Frontend continues polling on 204, but doesn't update UI unnecessarily

## Testing

### Test Cases

1. **Test milestone progression**:
   - Verify 204 responses before milestones
   - Verify 200 JSON responses at milestones
   - Verify API call count increments correctly

2. **Test completion**:
   - Verify PlainText response at 100%
   - Verify tracking cleanup on completion

3. **Test failure**:
   - Verify JSON error response on failure
   - Verify tracking cleanup on failure

4. **Test edge cases**:
   - Progress jumps from 20% to 60% (should return 25% and 50% milestones)
   - Multiple rapid API calls (should handle correctly)
   - Job not found (404 response)

## Notes

- The `ProgressTracker` can be implemented as a singleton or injected dependency
- Consider using Redis or database for job tracking in production (instead of in-memory dict)
- Add proper logging for debugging milestone logic
- Consider adding metrics/monitoring for API call patterns

