'use client';

// Inline SVG icons to avoid external deps and ensure reliable rendering
function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .587l3.668 7.431L23.4 9.75l-5.666 5.523L18.8 24 12 19.897 5.2 24l1.066-8.727L.6 9.75l7.732-1.732L12 .587z" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5l2.2 2.2L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Plan {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  buttonColor?: string;
}

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  isRound?: boolean;
}

export default function PlanCard({ plan, isSelected, onSelect, isRound }: PlanCardProps) {
  // Neutral card appearance (no colored top borders or rings)

  const roundingClass = isRound ? 'rounded-[28px]' : 'rounded-2xl';

  return (
    <div className={`relative ${roundingClass} transition-all duration-300 bg-[#2C303A] hover:bg-[#3A404C] hover:shadow-lg p-6 flex flex-col h-full overflow-hidden`}>

      {/* Plan Name */}
      <h3
        className={`text-2xl font-bold mb-2 text-white`}
      >
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mb-6">
        <span className={`text-4xl font-bold text-white`}>
          ${plan.price}
        </span>
        <span className={`text-sm ml-2 ${plan.isPopular ? 'text-[#A0A0A0]' : 'text-[#A0A0A0]'}`}>
          /month
        </span>
      </div>

      {/* Description */}
      {plan.description && (
        <p
          className={`text-sm mb-6 text-[#A0A0A0]`}
        >
          {plan.description}
        </p>
      )}

      {/* CTA Button */}
      <button
        onClick={onSelect}
        className={`w-full py-3 px-4 rounded-xl font-semibold mb-8 transition-all duration-200 bg-[#0B84FF] text-white hover:bg-[#0970CC] shadow-lg focus:outline-none ${
          isSelected ? 'ring-2 ring-blue-400' : ''
        }`}
        aria-pressed={isSelected}
      >
        {plan.buttonText || 'Choose Plan'}
      </button>

      {/* Features List */}
      <div className="space-y-3 flex-grow">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <CheckIcon className={`flex-shrink-0 mt-0.5 text-[#A0A0A0]`} />
            <span className={`text-sm text-[#A0A0A0]`}>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
