
export function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-[#F7F7F7]">
       <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
