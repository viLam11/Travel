import React from "react";

const AirplaneAnimation: React.FC = () => {
  return (
    <div className="fixed  top-5 right-5 w-[600px] h-[150px] floating-svg airplane-animation">
      <svg width="600" height="150" viewBox="0 0 600 150" fill="none">
        {/* đường bay ẩn - chỉ dùng để máy bay bay theo */}
        <path
          id="flightPath"
          d="M 600 75 Q 300 25 0 75"
          stroke="none"
          fill="none"
        />

        {/* vệt khói - xuất hiện theo máy bay */}
        <path
          d="M 600 75 Q 300 25 0 75"
          stroke="orange"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 6"
          strokeDashoffset="0"
          pathLength="100"
        >
          {/* hiệu ứng vệt khói - bắt đầu cùng lúc với máy bay */}
          <animate
            attributeName="stroke-dasharray"
            values="0 100;30 70;60 40;100 0"
            dur="6s"
            repeatCount="indefinite"
            begin="0s; motionAnim.end+5s"
          />
        </path>

        {/* máy bay */}
        <g transform="translate(-22, -17)">
          <path
            fill="#EB662B"
            d="M44.9427 17.4084C43.0116 19.2011 43.5659 18.9943 39.0817 17.6844C35.1487 16.4428 37.0122 16.0292 33.4959 18.0288C30.3217 19.8915 25.1487 21.7542 22.7332 23.2018C23.632 25.2028 31.3564 31.755 33.2192 34.4449C32.528 34.7893 31.9768 35.066 31.2188 35.4112C30.0457 35.9624 30.3217 35.9624 28.9426 35.1352C25.9075 33.4101 16.1811 27.8927 14.25 27.064C11.6993 28.1679 4.93801 31.6174 2.59485 31.479C1.49013 31.4106 -0.304166 31.1346 0.0441197 29.7547C0.938935 26.3752 7.00906 24.5117 10.9413 22.7874C12.5257 22.0986 12.1121 22.1678 12.4573 20.4419C12.8732 18.58 15.4939 5.06056 16.1143 4.37176C16.3903 4.16497 18.5282 3.26859 18.941 3.06102C19.1486 4.30335 19.2861 5.68249 19.3553 6.99245L20.0441 14.6485C20.0441 15.8901 20.2517 17.3384 20.4593 18.5108C22.252 17.6144 24.0456 16.8556 25.9083 15.9593C35.1495 11.5443 33.4967 14.5109 35.6323 9.54474C36.8762 6.78566 36.8762 5.12974 39.5653 5.54489C39.0817 11.0623 40.5969 14.5117 44.9427 17.4084Z"
          >
            <animateMotion
              id="motionAnim"
              dur="6s"
              repeatCount="indefinite"
              begin="0s; motionAnim.end+5s"
            >
              <mpath xlinkHref="#flightPath" />
            </animateMotion>
          </path>
        </g>
      </svg>
    </div>
  );
};

export default AirplaneAnimation;