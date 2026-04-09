# GDX Hub Developer Notes (for AI & Collaborators)

## 🚀 Overview
이 프로젝트는 금광주 ETF(GDXU/GDXY) 투자 협업을 위한 대시보드입니다. 토스(Toss) 스타일의 미니멀리즘과 다크 모드를 기본으로 합니다.

## 🛠️ Tech Stack & Versioning
- **Next.js**: 15+ (App Router)
- **Tailwind CSS**: v4 (PostCSS 플러그인 모드 사용, `@theme` 방식 설정)
- **Lightweight Charts**: v5.x (중요: v4의 `addAreaSeries`, `setMarkers` 등은 지원되지 않음. `addSeries(AreaSeries, ...)` 및 `createSeriesMarkers` API 사용 필수)
- **Supabase**: Auth, DB, Realtime, Storage 활용

## 🔑 Git & Account Management
- **다중 계정 대응**: 사용자 PC의 글로벌 계정과 충돌을 피하기 위해, 이 프로젝트의 Git Remote URL에는 **Personal Access Token(PAT)**이 포함되어 있습니다.
- **Local Config**: 프로젝트별 `user.name`과 `user.email`이 설정되어 있어 커밋 정보가 섞이지 않습니다.
- **배포**: Vercel 연동 시 반드시 새 계정의 저장소를 Import 해야 합니다.

## 🎨 UI/UX Guide
- **디자인 원칙**: 여백 위주의 미니멀리즘, 둥근 모서리(20px+), 블러 처리된 카드를 선호합니다.
- **언어**: 모든 메뉴와 안내 문구는 한국어를 원칙으로 합니다.
- **색상**: 
  - Bg: `#0f172a`
  - Brand: `#3b82f6`
  - Risk: `#ef4444`

## 📡 Database Schema
- `market_data`: OHLCV 시세
- `ai_predictions`: 모델별 예측 신호
- `reports`: PDF/이미지 리포트 경로
- `feeds`: 실시간 인사이트 타임라인

---
*Last Updated: 2026-04-09*
