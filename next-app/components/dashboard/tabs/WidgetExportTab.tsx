'use client'

interface WidgetExportTabProps {
  userName?: string
}

export default function WidgetExportTab({ userName = 'user' }: WidgetExportTabProps) {
  const markdownCode = `[![Skill Wallet](https://skillwallet.dev/api/widget/${userName}?theme=dark)](https://skillwallet.dev/${userName})`
  const iframeCode = `<iframe\n  src="https://skillwallet.dev/embed/${userName}"\n  width="350"\n  height="180"\n  frameborder="0"\n  scrolling="no"\n></iframe>`

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800/50 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Developer Widgets
          </h3>
          <p className="text-sm text-gray-400 mt-1">Embed your verified skills on your GitHub Readme or personal website.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Widget Preview */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Preview</h4>
          <div className="bg-[#090d14] border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden group">
            <div className="absolute w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none" />
            <div className="bg-[#161b22] border border-gray-800 p-4 rounded-xl shadow-2xl relative z-10 w-full max-w-sm">
              <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    {userName[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{userName}</p>
                    <p className="text-[9px] text-green-400">Verified Skills</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["React", "Node.js", "Python", "C++"].map(s => (
                  <span key={s} className="text-[10px] bg-[#090d14] border border-gray-700 text-gray-300 px-2 py-1 rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Snippets */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">GitHub Readme (Markdown)</h4>
              <button
                onClick={() => navigator.clipboard.writeText(markdownCode)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </button>
            </div>
            <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-x-auto">
              <code className="text-xs text-gray-300 font-mono whitespace-nowrap">{markdownCode}</code>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Website Embed (HTML Iframe)</h4>
              <button
                onClick={() => navigator.clipboard.writeText(iframeCode)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </button>
            </div>
            <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-x-auto">
              <code className="text-xs text-blue-300 font-mono whitespace-pre-wrap">{iframeCode}</code>
            </div>
          </div>

          {/* Export Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Export Portfolio</h4>
            <div className="grid grid-cols-3 gap-3">
              <button className="bg-[#161b22] border border-gray-800 hover:border-blue-500/50 rounded-xl p-4 text-center transition-all group">
                <div className="text-xl mb-2">??</div>
                <p className="text-white font-medium text-xs group-hover:text-blue-400">PDF Resume</p>
              </button>
              <button className="bg-[#161b22] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 text-center transition-all group">
                <div className="text-xl mb-2">??</div>
                <p className="text-white font-medium text-xs group-hover:text-purple-400">Public Link</p>
              </button>
              <button className="bg-[#161b22] border border-gray-800 hover:border-green-500/50 rounded-xl p-4 text-center transition-all group">
                <div className="text-xl mb-2">??</div>
                <p className="text-white font-medium text-xs group-hover:text-green-400">Portfolio</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
