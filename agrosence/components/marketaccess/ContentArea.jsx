"use client"

import React from "react"
import { Card, Button, Form } from "react-bootstrap"
import { FiPlus, FiMinus, FiShare2 } from "react-icons/fi"

const ContentArea = () => {
  const [quantity, setQuantity] = React.useState(1)

  return (
    <div className="p-2 p-sm-4">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="row g-4">
            {/* Product Image */}
            <div className="col-12 col-md-6">
              <img
                src="data:image/webp;base64,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"
                alt="Tomato"
                className="img-fluid rounded"
              />
            </div>

            {/* Product Details */}
            <div className="col-12 col-md-6">
              <h2 className="h3 mb-3">Tomato</h2>
              <div className="mb-3">
                <span className="text-success fs-4">$0.50</span>
                <small className="text-muted ms-2">(1 Customer Review)</small>
              </div>

              <p className="text-muted mb-4 small">
                Fresh, ripe tomatoes perfect for your culinary needs. Locally sourced and carefully selected for the
                best quality.
              </p>

              {/* Quantity Selector */}
              <div className="d-flex align-items-center mb-4 flex-wrap gap-2">
                <span className="me-2 small">Choose Quantity</span>
                <div className="d-flex align-items-center">
                  <Button variant="outline-secondary" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <FiMinus size={14} />
                  </Button>
                  <span className="mx-3 small">{quantity}</span>
                  <Button variant="outline-secondary" size="sm" onClick={() => setQuantity(quantity + 1)}>
                    <FiPlus size={14} />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 mb-4 flex-wrap">
                <Button variant="success" className="px-3 py-2 small">
                  Buy Now
                </Button>
                <Button variant="warning" className="px-3 py-2 small">
                  Add to Wishlist
                </Button>
              </div>

              {/* Share */}
              <div className="d-flex align-items-center">
                <FiShare2 className="me-2" size={14} />
                <span className="small">Share with Friends</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-4 mt-sm-5">
            <h3 className="h4 mb-3">Description</h3>
            <p className="text-muted small">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sodales tortor nunc, quis auctor
              ligula posuere cursus. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur.
            </p>
          </div>

          {/* Reviews Section */}
          <div className="mt-4 mt-sm-5">
            <h3 className="h4 mb-4">Reviews</h3>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="small">Your Rating</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Your Review..." className="small" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control type="text" placeholder="Your Name" className="small" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control type="email" placeholder="Email Address" className="small" />
              </Form.Group>
              <Button variant="success" type="submit" className="small">
                Submit Review
              </Button>
            </Form>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ContentArea

