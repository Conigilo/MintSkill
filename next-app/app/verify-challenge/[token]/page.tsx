/**
 * Verify Challenge Page
 * TODO: Uncomment and implement when challenges feature is ready
 */

export default function VerifyChallengePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-2xl mx-auto pt-24 px-6">
        <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Coming Soon</h2>
          <p className="text-slate-500 text-sm">The challenge verification feature is under development.</p>
        </div>
      </div>
    </main>
  )
}
