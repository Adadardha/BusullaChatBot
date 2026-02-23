+import React from 'react';
+
+const Scene: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
+  return (
+    <div className="absolute inset-0 -z-10 pointer-events-none opacity-70">
+      <div className="w-full h-full flex items-center justify-center">
+        {children}
+      </div>
+    </div>
+  );
+};
+
+export default Scene;
