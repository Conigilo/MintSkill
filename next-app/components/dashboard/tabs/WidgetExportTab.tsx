export default function WidgetExportTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Embeddable Widget Section */}
      <div className="glass-panel p-8 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6">Embeddable Widget</h3>

        {/* Preview Card */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">F</div>
            <div>
              <p className="text-white font-semibold text-sm">Sarit Sridit</p>
              <p className="text-gray-400 text-xs mb-2">Full-Stack Developer • Bangkok</p>
              <div className="flex gap-2">
                <span className="text-[10px] border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded">React</span>
                <span className="text-[10px] border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded">Node.js</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">12 endorsements</p>
            <p className="text-xs text-green-400 flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> skill wallet</p>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 flex justify-between items-center">
          <code className="text-xs text-gray-400 font-mono">
            &lt;iframe src="https://skillwallet.dev/widget/Conigilo" /&gt;
          </code>
          <button className="text-xs border border-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors">Copy</button>
        </div>
      </div>

      {/* Export Section */}
      <div className="glass-panel p-8 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6">Export Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-[#161b22] border border-gray-800 hover:border-blue-500/50 rounded-xl p-6 text-center transition-all group">
            <div className="text-2xl mb-3">📄</div>
            <p className="text-white font-medium text-sm mb-1 group-hover:text-blue-400">PDF Resume</p>
            <p className="text-xs text-gray-500">ATS-friendly format</p>
          </button>
          <button className="bg-[#161b22] border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 text-center transition-all group">
            <div className="text-2xl mb-3">🔗</div>
            <p className="text-white font-medium text-sm mb-1 group-hover:text-purple-400">Public Link</p>
            <p className="text-xs text-gray-500">skillwallet.dev/fiu</p>
          </button>
          <button className="bg-[#161b22] border border-gray-800 hover:border-green-500/50 rounded-xl p-6 text-center transition-all group">
            <div className="text-2xl mb-3">🎨</div>
            <p className="text-white font-medium text-sm mb-1 group-hover:text-green-400">Portfolio Page</p>
            <p className="text-xs text-gray-500">Beautiful web page</p>
          </button>
        </div>
      </div>

    </div>
  );
}