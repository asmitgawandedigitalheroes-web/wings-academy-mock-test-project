import React from 'react';

const PerformanceCard = ({ percentage, label, description, color = "var(--accent)" }: { percentage: number, label: string, description: string, color?: string }) => {
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-slate-100 p-8 rounded-[2.5rem] text-center flex flex-col items-center hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="relative mb-8">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-primary">{percentage}%</span>

        </div>
      </div>

      <h3 className="text-xl font-black text-primary mb-3 tracking-tight group-hover:text-accent transition-colors">
        {label}
      </h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[200px]">
        {description}
      </p>
    </div>
  );
};

const PerformanceSection = () => {
  const analytics = [
    {
      percentage: 90,
      label: "Overall Progress",
      description: "Your consolidated performance score across all flight modules."
    },
    {
      percentage: 75,
      label: "Technical Proficiency",
      description: "Score analysis on complex aircraft systems and engineering questions."
    },
    {
      percentage: 95,
      label: "Law & Procedures",
      description: "Performance stability in regulatory and procedural safety topics."
    }
  ];

  return (
    <section className="bg-white py-20 lg:py-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-4 leading-tight">
          Master Your <span className="text-accent">Performance</span>
        </h2>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Advanced analytics to track your readiness for the real exam.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {analytics.map((item, index) => (
            <PerformanceCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;
