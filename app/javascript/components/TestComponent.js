import React from 'react'
import * as ReactDOM from 'react-dom'

const TestComponent = () => {
  const [count, setCount] = React.useState(0)

  return React.createElement('div', 
    { className: "bg-slate-800 p-4 rounded-lg shadow-xl m-4" },
    React.createElement('h2', 
      { className: "text-amber-500 text-xl font-bold mb-2" },
      "React is Working! 🎉"
    ),
    React.createElement('button', {
      onClick: () => setCount(count + 1),
      className: "bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded"
    }, `Clicked ${count} times`)
  )
}

// Mount component using older createRoot method
document.addEventListener('turbo:load', () => {
  const container = document.getElementById('react-test')
  if (container) {
    ReactDOM.render(React.createElement(TestComponent), container)
  }
})

export default TestComponent 