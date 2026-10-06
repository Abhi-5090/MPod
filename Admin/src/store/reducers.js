import { combineReducers } from "redux"

import Layout from "./layout/reducer"
import Breadcrumb from "./Breadcrumb/reducer"

const rootReducer = combineReducers({
  Layout,
  Breadcrumb,
})

export default rootReducer
