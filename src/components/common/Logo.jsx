import React from 'react';

const Logo = ({ size = 'md', className = "" }) => {
    const dimensions = {
        sm: { box: 32, icon: 20 },
        md: { box: 40, icon: 26 },
        lg: { box: 48, icon: 32 },
        xl: { box: 64, icon: 44 }
    }[size] || { box: 40, icon: 26 };

    return (
        <div
            className={`relative flex items-center justify-center group ${className}`}
            style={{
                width: dimensions.box,
                height: dimensions.box,
                perspective: '1000px'
            }}
        >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Main Rounded Box */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-lg border border-white/10 overflow-hidden"
                style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {/* Shine Animation Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                {/* SVG Icon Area */}
                <div className="absolute inset-0 flex items-center justify-center p-1.5">
                    <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: '85%', height: '85%' }}
                    >
                        {/* THE "Z" - White Base */}
                        <path
                            d="M25 30H75L25 70H75"
                            stroke="white"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                        />

                        {/* DATA POINTS & CHART LINE (The "Impressive" part) */}
                        {/* Connecting Line */}
                        <path
                            d="M15 65 L40 45 L55 55 L75 35 L90 40"
                            stroke="#38bdf8"
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{
                                strokeDasharray: 200,
                                strokeDashoffset: 200,
                                animation: 'drawPath 2s ease-out forwards'
                            }}
                        />

                        {/* Animated Nodes */}
                        {[
                            { x: 15, y: 65, d: '0.2s' },
                            { x: 40, y: 45, d: '0.5s' },
                            { x: 55, y: 55, d: '0.8s' },
                            { x: 75, y: 35, d: '1.1s' }
                        ].map((point, i) => (
                            <g key={i}>
                                {/* Outer Glow */}
                                <circle
                                    cx={point.x} cy={point.y} r="5"
                                    fill="#38bdf8"
                                    className="opacity-50"
                                    style={{
                                        animation: `pulsePoint 2s ease-in-out infinite alternate`,
                                        animationDelay: point.d
                                    }}
                                />
                                {/* Inner Core */}
                                <circle
                                    cx={point.x} cy={point.y} r="3"
                                    fill="white"
                                />
                            </g>
                        ))}

                        {/* Semantic indicator of growth - Arrow head */}
                        <path
                            d="M85 35 L90 40 L85 45"
                            stroke="#38bdf8"
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{
                                opacity: 0,
                                animation: 'fadeIn 0.5s ease-out 1.5s forwards'
                            }}
                        />
                    </svg>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes drawPath {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes pulsePoint {
                    0% { transform: scale(1); opacity: 0.3; }
                    100% { transform: scale(1.8); opacity: 0.7; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}} />
        </div>
    );
};

export default Logo;
