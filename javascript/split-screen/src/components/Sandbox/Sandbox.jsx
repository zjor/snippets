import styles from './Sandbox.module.css'

function Sandbox() {
    return (
        <div className={styles.wrapper}>
            <div>
                <div className={styles.inner}>
                    <div>one</div>
                    <div>two</div>
                </div>
            </div>
            <div>two</div>
        </div>
    )
}

export default Sandbox