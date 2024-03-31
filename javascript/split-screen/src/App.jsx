import './App.css'
import SplitNode from "./components/SplitNode/SplitNode.jsx";
import Splittable from "./components/Splittable/Splittable.jsx";
import {useState} from "react";

const randomColor = () => {
    const colors = [
        "#E6E6FA", // Lavender
        "#DDA0DD", // Plum
        "#D8BFD8", // Thistle
        "#DA70D6", // Orchid
        "#EE82EE", // Violet
        "#FFC0CB", // Pink
        "#FFB6C1", // LightPink
        "#FFDAB9", // PeachPuff
        "#FFE4E1", // MistyRose
        "#FFFACD", // LemonChiffon
        "#F0FFF0", // Honeydew
        "#F5FFFA", // MintCream
        "#F0FFFF", // Azure
        "#F0F8FF", // AliceBlue
        "#FFF0F5", // LavenderBlush
        "#FFF5EE", // Seashell
        "#F5F5DC", // Beige
        "#B0E0E6", // PowderBlue
        "#ADD8E6", // LightBlue
        "#87CEEB", // SkyBlue
    ]
    return colors[Math.floor(Math.random() * colors.length)]
}

const tree = {
    type: 'node',
    vertical: false,
    first: {
        type: 'leaf',
        content: 'Hello',
        color: randomColor()
    },
    second: {
        type: 'leaf',
        content: 'World',
        color: randomColor()
    }
}

function App() {

    function buildTree(node) {
        if (node.type == 'leaf') {
            const onSplit = () => {
                node.type = 'node'
                node.vertical = (Math.random() > 0.5 ? true : false)
                node.first = {
                    type: 'leaf',
                    content: 'Hello',
                    color: randomColor()
                }
                node.second = {
                    type: 'leaf',
                    content: 'World',
                    color: randomColor()
                }
                setRoot(buildTree(tree))
            }
            return new Splittable({content: node.content, color: node.color, onSplit})
        } else {
            return new SplitNode({first: buildTree(node.first), second: buildTree(node.second), vertical: node.vertical})
        }
    }

    const [root, setRoot] = useState(buildTree(tree))
    return (
            <div style={{height: '100vh'}}>
                {root}
            </div>
    )
}

export default App
