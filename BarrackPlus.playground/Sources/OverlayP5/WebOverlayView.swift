import SwiftUI
import WebKit

public struct WebOverlayView: UIViewRepresentable {
    private let bridge = OverlayBridge()

    public init() {}

    public func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.userContentController.add(bridge, name: "overlayEvent")
        let view = WKWebView(frame: .zero, configuration: config)
        if let url = Bundle.main.url(forResource: "p5", withExtension: "html") {
            view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return view
    }

    public func updateUIView(_ uiView: WKWebView, context: Context) {}
}
