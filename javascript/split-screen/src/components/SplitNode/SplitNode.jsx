import styles from './SplitNode.module.css'

function SplitNode({first, second, vertical=true}) {
    return (
        <div className={`${styles.wrapper} ${vertical ? styles.vertical : styles.horizontal}`}>
            <div className={styles.first}>{first}</div>
            <div className={styles.splitter}/>
            <div className={styles.second}>{second}</div>
        </div>
    )
}

export default SplitNode