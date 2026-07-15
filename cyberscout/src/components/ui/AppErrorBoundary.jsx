import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('Application render failed', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="app-error-boundary">
        <section role="alert">
          <p className="site-eyebrow">Page error</p>
          <h1>This page could not be displayed</h1>
          <p>Your account and saved work have not been changed. Reload the page, or return to the Cyber Lab IN website.</p>
          <div className="site-action-row">
            <button type="button" className="site-button-primary" onClick={() => window.location.reload()}>Reload page</button>
            <a className="site-button-secondary" href="/">Return to homepage</a>
          </div>
        </section>
      </main>
    )
  }
}
