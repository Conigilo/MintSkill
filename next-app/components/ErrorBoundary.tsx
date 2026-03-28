/**
 * Error Boundary Component for catching and displaying errors
 */

'use client'

import { ReactNode, Component, ReactElement, ErrorInfo } from 'react'
import { Alert } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactElement
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <div className="p-6 space-y-4">
          <Alert 
            type="error" 
            title="Something went wrong" 
            message={this.state.error.message}
          />
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
