import Image from 'next/image';
import { HeartIcon, MusicIcon, PaperPlaneIcon } from '@/components/icons';
import { Lines } from '@/components/ui/Lines';
import type { Story, StoryAuthor } from '@/content/home';
import styles from './StoryCard.module.css';

type StoryCardProps = {
  story: Story;
  author: StoryAuthor;
};

/** A social story preview. The platform chrome is decorative and hidden from assistive tech. */
export function StoryCard({ story, author }: StoryCardProps) {
  const { overlay } = story;

  return (
    <article className={styles.card}>
      <Image
        src={story.src}
        alt={story.alt}
        sizes="(max-width: 959px) 240px, min(17.5vw, 252px)"
        placeholder="blur"
        className={styles.image}
      />

      <div className={styles.header} aria-hidden="true">
        <span className={styles.avatar}>
          <Image src={author.avatar} alt="" sizes="32px" className={styles.avatarImage} />
        </span>
        <div>
          <p className={styles.handle}>
            {author.handle} <span className={styles.postedAgo}>{author.postedAgo}</span>
          </p>
          <p className={styles.soundtrack}>
            <MusicIcon className={styles.musicIcon} />
            {author.soundtrack}
          </p>
        </div>
      </div>

      {overlay?.kind === 'quote' && (
        <p className={styles.quote}>
          <Lines lines={overlay.lines} breaks="always" />
        </p>
      )}

      {overlay?.kind === 'caption' && (
        <div className={styles.caption}>
          <p className={styles.captionTitle}>{overlay.title}</p>
          <p className={styles.captionText}>
            <Lines lines={overlay.lines} breaks="always" />
          </p>
        </div>
      )}

      <div className={styles.actions} aria-hidden="true">
        <span className={styles.reply} />
        {story.showActions && (
          <>
            <HeartIcon className={styles.actionIcon} />
            <PaperPlaneIcon className={styles.actionIcon} />
          </>
        )}
      </div>
    </article>
  );
}
