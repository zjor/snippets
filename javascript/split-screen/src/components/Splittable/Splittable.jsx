import styles from './Splittable.module.css'

function Splittable({content, color, onSplit}) {
    return (
        <div
            className={styles.wrapper}
            style={{backgroundColor: color}}
            onClick={onSplit}>{content}</div>
    )
}

export default Splittable