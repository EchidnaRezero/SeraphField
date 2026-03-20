import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { SITE_PROFILE } from '../config/siteProfile';
import { SITE_META } from '../config/siteMeta';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-hud-bg font-ui text-[#e0fbfc]">
      <div className="relative z-10 flex min-h-[100dvh] flex-col p-4 md:h-screen md:min-h-0 md:p-8">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={onBack}
              className="rounded-full border border-neon-cyan/20 p-2 transition-colors group hover:bg-neon-cyan/10"
            >
              <ArrowLeft className="h-5 w-5 text-neon-cyan/60 group-hover:text-neon-cyan" />
            </button>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-neon-cyan/60">
                Field_Profile
              </div>
              <h1 className="text-3xl font-bold uppercase tracking-wider text-neon-cyan/88 md:text-4xl">
                {SITE_META.name}
              </h1>
            </div>
          </div>
          <a
            href={SITE_PROFILE.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex self-start items-center gap-2 border border-neon-cyan/24 px-4 py-2 text-[12px] font-mono uppercase tracking-[0.2em] text-neon-cyan transition-colors hover:bg-neon-cyan/10 hover:text-white lg:self-auto"
          >
            Github <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </header>

        <section className="flex-1 border border-neon-cyan/20 bg-black/32 p-6 backdrop-blur-md md:p-10">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-18 w-18 overflow-hidden rounded-full border border-neon-cyan/28 bg-neon-cyan/8">
              <img
                src={SITE_PROFILE.avatarUrl}
                alt={`${SITE_PROFILE.displayName} avatar`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-neon-cyan/62">
                {SITE_PROFILE.roleLabel}
              </div>
              <div className="text-3xl font-bold uppercase tracking-[0.08em] text-[rgba(246,252,255,0.94)] md:text-4xl">
                {SITE_PROFILE.displayName}
              </div>
            </div>
          </div>

          <div className="max-w-4xl space-y-5 text-base leading-7 text-white/72 md:text-[1.05rem] md:leading-8">
            <p>Obsidian RAW 문서를 정리하고, {SITE_META.name}에서 HUD 스타일로 렌더링하는 프로필 페이지입니다.</p>
            <p>현재 구조는 Markdown 기반 정적 사이트이며, GitHub Pages 배포를 전제로 콘텐츠 파이프라인과 검색 인덱스를 함께 관리합니다.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
