/**
 * Catches render errors in its subtree and shows a recoverable message instead of a blank page.
 *   <ErrorBoundary> ... </ErrorBoundary>          (App.jsx wraps the router; wrap risky widgets too)
 * Resets when `resetKey` changes (App passes the pathname so navigating away clears the error).
 */
import { Component } from 'react'
import { ErrorState } from './States'
import { Button } from './Button'

export class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('UI error:', error, info?.componentStack) }
  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="ag-container" style={{ paddingBlock: 'var(--s-8)' }}>
        <ErrorState
          title="This page hit a problem"
          message="It is not your fault. Reload the page, or go back home and try again."
          onRetry={() => this.setState({ error: null })}
        />
        <div className="ag-state__actions" style={{ marginTop: 'var(--s-3)' }}>
          <Button as="a" href="/">Back to home</Button>
        </div>
      </div>
    )
  }
}
