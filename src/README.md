## Attachement Preview Component:
// TODO: User Show Image and Document Preview before sending the message ;
Used only in MessageInput Component;

## Audio Recorder Component: 
- AudioRecorder component do variants render karta hai: button (mic icon) aur ui (recording controls)
- Props se recording state aur functions lete hain (context removed)
- All Functions --> AudioRecorder (props) --> useAudioRecorder hook actual recording logic handle karta hai
- AudioRecorder = UI component (presentation layer)
- useAudioRecorder = Business logic (actual recording work + backend API call)
- MessageInput component direct hook use karta hai
- Flow: Button click → Recording start → UI show → Send (backend + MessageList) → State reset
- Audio messages MessageList mein audio player ke saath show hote hain