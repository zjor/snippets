import styles from './Splittable.module.css'

function Splittable({depth, content, color, onSplit}) {
    // const onMouseMove = (e) => {
    //     const n = e.nativeEvent
    //     const t = e.target
    //     const [dx, dy] = [
    //         Math.floor(t.offsetWidth / 3),
    //         Math.floor(t.offsetHeight / 3)
    //     ]
    //     const [bx, by] = [
    //         Math.floor(n.offsetX / dx),
    //         Math.floor(n.offsetY / dy)
    //     ]
    //     console.log(bx, by)
    // }

    const onClick = (e) => {
        const n = e.nativeEvent
        const t = e.target
        const [dx, dy] = [
            Math.floor(t.offsetWidth / 3),
            Math.floor(t.offsetHeight / 3)
        ]
        const [bx, by] = [
            Math.floor(n.offsetX / dx),
            Math.floor(n.offsetY / dy)
        ]
        let direction = undefined
        if ((bx == 0 || bx == 2) && by == 1) {
            direction = 'vertical'
        } else if ((by == 0 || by == 2) && bx == 1) {
            direction = 'horizontal'
        }

        onSplit(direction)
    }
    return (
        <div
            className={styles.wrapper}
            style={{backgroundColor: color}}
            // onMouseMove={onMouseMove}
            onClick={onClick}>
            <div className={styles.content}>
                <div className={styles.depth}>{depth}</div>
                {content}
            </div>
        </div>
    )
}

export default Splittable