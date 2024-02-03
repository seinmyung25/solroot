import { BlockProps } from '@/types/Block'
import styles from '@/components/base/InfoBlock/InfoBlock.module.scss'
import classNames from 'classnames/bind'

const cn = classNames.bind(styles);

const InfoBlock = ({ title, content, subContent, isAccount, isLoading, children }: BlockProps) => {

  return (
    <article className={styles.container}>
      <div className={styles.title}>
        {title}
      </div>
      <div className={styles.contentContainer}>
        {isLoading || (
          <>
            <div className={cn('content', isAccount && 'content-account')}>
              {content}
              {children}
            </div>
            {subContent && (
              <div className={styles.subContent}>
                {subContent}
              </div>
            )}
          </>
        )}
      </div>
    </article>  
  )
}

export default InfoBlock