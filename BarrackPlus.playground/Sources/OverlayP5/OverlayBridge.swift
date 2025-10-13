import SwiftUI
import WebKit

public final class OverlayBridge: NSObject, WKScriptMessageHandler {
    public var onEvent: ((String) -> Void)?

    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "overlayEvent", let body = message.body as? String else { return }
        onEvent?(body)
    }
}
