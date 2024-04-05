import styles from './Splittable.module.css'

function Splittable({depth, content, color, onSplit}) {
    return (
        <div
            className={styles.wrapper}
            style={{backgroundColor: color}}>
            <div className={styles.content}>
                <div className={styles.depth}>{depth}</div>
                {content}
                <div className={styles.grid}>
                    <div></div>
                    <div
                        className={styles.clickable}
                        onClick={() => onSplit('horizontal')}>
                    </div>
                    <div></div>
                    <div
                        className={styles.clickable}
                        onClick={() => onSplit('vertical')}>
                    </div>
                    <div></div>
                    <div
                        className={styles.clickable}
                        onClick={() => onSplit('vertical')}>
                    </div>
                    <div></div>
                    <div
                        className={styles.clickable}
                        onClick={() => onSplit('horizontal')}>
                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}

export default Splittable