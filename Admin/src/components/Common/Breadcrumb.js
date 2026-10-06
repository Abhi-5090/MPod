import React from "react"
import PropTypes from "prop-types"
import { Row, Col } from "reactstrap"
import { connect } from "react-redux"
import { Link } from "react-router-dom"

const Breadcrumb = props => {
  const items = props.breadcrumbItems || []
  return (
    <Row>
      <Col sm={12}>
        <div className="page-title-box">
          <h4>{props.title}</h4>
          <ol className="breadcrumb m-0">
            {items.map((item, key) =>
              key + 1 === items.length || !item.link || item.link === "#" ? (
                <li key={key} className={`breadcrumb-item${key + 1 === items.length ? " active" : ""}`}>
                  {item.title}
                </li>
              ) : (
                <li key={key} className="breadcrumb-item">
                  <Link to={item.link}>{item.title}</Link>
                </li>
              )
            )}
          </ol>
        </div>
      </Col>
    </Row>
  )
}

Breadcrumb.propTypes = {
  title: PropTypes.node,
  breadcrumbItems: PropTypes.array,
}

const mapStatetoProps = state => ({
  title: state.Breadcrumb.title,
  breadcrumbItems: state.Breadcrumb.breadcrumbItems,
})

export default connect(mapStatetoProps, {})(Breadcrumb)
