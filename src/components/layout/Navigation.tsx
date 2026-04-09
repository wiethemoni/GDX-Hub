'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: '홈', href: '/home', icon: Home },
  { name: '심층 분석', href: '/analysis', icon: BarChart3 },
  { name: '분석 리포트', href: '/reports', icon: FileText },
  { name: '피드', href: '/insights', icon: MessageSquare },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 p-6 space-y-8">
      <div className="flex items-center space-x-3 px-2">
        <div className="bg-brand p-2 rounded-lg">
          <TrendingUp className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">GDX Hub</span>
      </div>

      <div className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-brand/10 text-brand font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-brand" : "text-slate-500 group-hover:text-slate-400"
              )} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-slate-800 pt-6">
        <button className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-slate-200 w-full transition-colors">
          <Settings className="w-5 h-5" />
          <span>환경 설정</span>
        </button>
      </div>
    </nav>
  );
}
