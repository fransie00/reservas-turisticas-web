export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <main className="mx-auto w-full max-w-4xl flex-1 p-6">{children}</main>;
}
