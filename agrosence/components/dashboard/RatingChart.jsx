const RatingChart = () => {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title">Your Rating</h5>
        <p className="text-muted small">Lorem ipsum dolor sit amet, consectetur</p>

        <div className="position-relative" style={{ height: "300px" }}>
          <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
            <div className="fs-1 fw-bold text-primary">85%</div>
            <div>Food Taste</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RatingChart

