
import React from 'react';

export const ASCIIHeader = () => (
  <div className="text-[6px] leading-[1] font-mono opacity-20 pointer-events-none select-none overflow-hidden h-12">
    {`
    ██████╗ ██╗   ██╗███████╗██╗   ██╗██╗     ██╗      █████╗ 
    ██╔══██╗██║   ██║██╔════╝██║   ██║██║     ██║     ██╔══██╗
    ██████╔╝██║   ██║███████╗██║   ██║██║     ██║     ███████║
    ██╔══██╗██║   ██║╚════██║██║   ██║██║     ██║     ██╔══██║
    ██████╔╝╚██████╔╝███████║╚██████╔╝███████╗███████╗██║  ██║
    ╚═════╝  ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
    `}
  </div>
);

export const ASCIILoader = () => (
  <div className="font-mono text-[10px] leading-tight text-white/40">
    {`
     [ LOADING ]
     |/-\|/-\|/
     [ ======= ]
    `}
  </div>
);

export const ASCIIGrid = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden z-[-1] font-mono text-[8px] leading-[1]">
    {Array.from({ length: 100 }).map((_, i) => (
      <div key={i}>
        {"+-------".repeat(20) + "+"}
      </div>
    ))}
  </div>
);
