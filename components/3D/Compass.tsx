+import React from 'react';
+
+const Compass: React.FC<{ isSpinning?: boolean }> = ({ isSpinning = false }) => {
+  return (
+    <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-full border border-white/20 ${isSpinning ? 'animate-spin' : ''}`}>
+      <div className="absolute inset-3 rounded-full border border-white/10" />
+      <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[10px] font-mono opacity-50">V</div>
+      <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-[10px] font-mono opacity-50">J</div>
+      <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] font-mono opacity-50">P</div>
+      <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-mono opacity-50">L</div>
+      <div className="absolute left-1/2 top-1/2 w-[2px] h-16 -translate-x-1/2 -translate-y-1/2 bg-white/70" />
+      <div className="absolute left-1/2 top-1/2 w-16 h-[2px] -translate-x-1/2 -translate-y-1/2 bg-white/30" />
+      <div className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
+    </div>
+  );
+};
+
+export default Compass;
 
EOF
)
