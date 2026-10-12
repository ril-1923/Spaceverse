import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {HashRouter} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import {Provider} from './store'
import App from './App'
createRoot(document.getElementById('root')!).render(<StrictMode><HashRouter><Provider><App/></Provider></HashRouter></StrictMode>)
