import PropTypes from "prop-types"
import React, { useCallback, useEffect, useMemo, useRef } from "react"
import SimpleBar from "simplebar-react"
import MetisMenu from "metismenujs"
import { Link } from "react-router-dom"
import { withTranslation } from "react-i18next"

import withRouter from "@/components/Common/withRouter"
import { useAuth } from "../../context/AuthContext"
import { getMenuForUser } from "../../config/menu"

const iconUrl = name => `${import.meta.env.BASE_URL}dashboard-icons/${name}`

const SidebarContent = props => {
  const ref = useRef()
  const { user } = useAuth()
  const menu = useMemo(() => getMenuForUser(user), [user])

  const scrollElement = item => {
    if (item && ref.current) {
      const currentPosition = item.offsetTop
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300
      }
    }
  }

  const activateParentDropdown = useCallback(item => {
    item.classList.add("active")
    const parent = item.parentElement
    const parent2El = parent && parent.childNodes[1]
    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show")
    }
    if (parent) {
      parent.classList.add("mm-active")
      const parent2 = parent.parentElement
      if (parent2) {
        parent2.classList.add("mm-show")
        const parent3 = parent2.parentElement
        if (parent3) {
          parent3.classList.add("mm-active")
          if (parent3.childNodes[0]) parent3.childNodes[0].classList.add("mm-active")
        }
      }
    }
    scrollElement(item)
  }, [])

  const removeActivation = items => {
    for (let i = 0; i < items.length; ++i) {
      const item = items[i]
      const parent = item.parentElement
      item.classList.remove("active")
      if (parent) {
        parent.classList.remove("mm-active")
        const parent2 = parent.parentElement
        if (parent2 && parent2.id !== "side-menu") {
          parent2.classList.remove("mm-show")
          const parent3 = parent2.parentElement
          if (parent3) {
            parent3.classList.remove("mm-active")
            if (parent3.childNodes[0]) parent3.childNodes[0].classList.remove("mm-active")
          }
        }
      }
    }
  }

  const activeMenu = useCallback(() => {
    const ul = document.getElementById("side-menu")
    if (!ul) return
    const pathName = props.router.location.pathname
    const items = ul.getElementsByTagName("a")
    removeActivation(items)
    for (let i = 0; i < items.length; ++i) {
      // items[i].pathname includes the /admin basename
      if (items[i].pathname.replace(/^\/admin/, "") === pathName) {
        activateParentDropdown(items[i])
        break
      }
    }
  }, [props.router.location.pathname, activateParentDropdown])

  useEffect(() => {
    if (ref.current) ref.current.recalculate()
  }, [menu])

  useEffect(() => {
    if (!menu.length) return undefined
    const mm = new MetisMenu("#side-menu")
    activeMenu()
    return () => mm.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    activeMenu()
  }, [activeMenu])

  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {menu.map((section, sIdx) => (
              <React.Fragment key={section.section || `section-${sIdx}`}>
                {section.section && <li className="menu-title">{props.t(section.section)}</li>}
                {section.groups.map(group => (
                  <li key={group.title}>
                    <Link to="/#" className="has-arrow waves-effect">
                      <i>
                        <img src={iconUrl(group.icon)} alt="" style={{ height: "18px" }} />
                      </i>
                      <span>{props.t(group.title)}</span>
                    </Link>
                    <ul className="sub-menu">
                      {group.items.map(item => (
                        <li key={item.to}>
                          <Link to={item.to}>{props.t(item.label)}</Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  )
}

SidebarContent.propTypes = {
  router: PropTypes.object,
  t: PropTypes.any,
}

export default withRouter(withTranslation()(SidebarContent))
