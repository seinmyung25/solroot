import { BaseTagProps } from '@/types/Tag'
import styles from '@/components/base/Tag/BaseTag.module.scss'
import classNames from 'classnames/bind'

const cn = classNames.bind(styles);



const BaseTag = ({ title, size, color }: BaseTagProps) => {
  return (
    <div className={cn('container', `container-${size}`, `container-${color}`)}>
      {title}
    </div>
  )
}

export default BaseTag