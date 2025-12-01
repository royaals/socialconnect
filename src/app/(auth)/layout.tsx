
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">

      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        {children}
      </div>


      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#F59E0B] to-[#D97706] items-center justify-center p-12">
        <div className="max-w-md">
     
        </div>
      </div>
    </div>
  );
}