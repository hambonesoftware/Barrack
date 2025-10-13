import SwiftUI
#if !canImport(UIKit)
import AppKit
#endif

#if canImport(UIKit)
typealias RetroRectCorner = UIRectCorner
#else
struct RetroRectCorner: OptionSet {
    let rawValue: Int

    static let topLeft = RetroRectCorner(rawValue: 1 << 0)
    static let topRight = RetroRectCorner(rawValue: 1 << 1)
    static let bottomLeft = RetroRectCorner(rawValue: 1 << 2)
    static let bottomRight = RetroRectCorner(rawValue: 1 << 3)
    static let allCorners: RetroRectCorner = [.topLeft, .topRight, .bottomLeft, .bottomRight]
}
#endif

// MARK: - Retro Styling

struct RetroStyling {
    struct Panel {
        let baseTop = Color(red: 0.83, green: 0.83, blue: 0.86)
        let baseBottom = Color(red: 0.69, green: 0.69, blue: 0.72)
        let highlight = Color(red: 0.96, green: 0.96, blue: 0.98)
        let shadow = Color(red: 0.32, green: 0.34, blue: 0.39)
        let pressedTop = Color(red: 0.63, green: 0.63, blue: 0.66)
        let pressedBottom = Color(red: 0.80, green: 0.80, blue: 0.83)
        let textureBright = Color(red: 0.92, green: 0.92, blue: 0.95)
        let textureDark = Color(red: 0.62, green: 0.62, blue: 0.65)
    }

    static let panel = Panel()

    static let textPrimary = Color(red: 0.12, green: 0.12, blue: 0.16)
    static let textSecondary = Color(red: 0.28, green: 0.28, blue: 0.34)
    static let accent = Color(red: 0.00, green: 0.36, blue: 0.86)
}

// MARK: - Layout Metrics

struct HUDLayoutMetrics {
    struct Element: Hashable, Codable {
        let name: String
        let expectedOrigin: CGPoint
        let size: CGSize

        func frame(scale: CGFloat, offset: CGPoint) -> CGRect {
            CGRect(origin: CGPoint(x: snap(expectedOrigin.x * scale + offset.x),
                                    y: snap(expectedOrigin.y * scale + offset.y)),
                   size: CGSize(width: snap(size.width * scale),
                                height: snap(size.height * scale)))
        }
    }

    static let baseResolution = CGSize(width: 640, height: 480)

    static let elements: [Element] = [
        Element(name: "score", expectedOrigin: CGPoint(x: 24, y: 16), size: CGSize(width: 148, height: 44)),
        Element(name: "fill", expectedOrigin: CGPoint(x: 204, y: 20), size: CGSize(width: 232, height: 40)),
        Element(name: "lives", expectedOrigin: CGPoint(x: 468, y: 16), size: CGSize(width: 148, height: 44)),
        Element(name: "level", expectedOrigin: CGPoint(x: 24, y: 68), size: CGSize(width: 148, height: 32)),
        Element(name: "target", expectedOrigin: CGPoint(x: 468, y: 68), size: CGSize(width: 148, height: 32)),
        Element(name: "pause", expectedOrigin: CGPoint(x: 200, y: 412), size: CGSize(width: 240, height: 64))
    ]

    let containerSize: CGSize

    var scale: CGFloat {
        let widthScale = containerSize.width / HUDLayoutMetrics.baseResolution.width
        let heightScale = containerSize.height / HUDLayoutMetrics.baseResolution.height
        return min(widthScale, heightScale)
    }

    var topBarHeight: CGFloat { snap(88 * scale) }
    var panelCornerRadius: CGFloat { snap(6 * scale) }
    var fontScale: CGFloat { scale }
    var overlaySize: CGSize { CGSize(width: snap(256 * scale), height: snap(64 * scale)) }
    var overlayBottomInset: CGFloat { snap(48 * scale) }

    var topBarOffset: CGPoint {
        let width = HUDLayoutMetrics.baseResolution.width * scale
        let x = (containerSize.width - width) / 2
        return CGPoint(x: x, y: snap(12 * scale))
    }

    func frame(for element: Element) -> CGRect {
        element.frame(scale: scale, offset: topBarOffset)
    }

    func pauseFrame(in geometry: GeometryProxy) -> CGRect {
        let element = HUDLayoutMetrics.elements.first { $0.name == "pause" }!
        let offset = CGPoint(x: (geometry.size.width - HUDLayoutMetrics.baseResolution.width * scale) / 2,
                             y: snap(geometry.size.height - HUDLayoutMetrics.baseResolution.height * scale) / 2)
        return element.frame(scale: scale, offset: offset)
    }
}

// MARK: - Retro HUD Components

struct RetroHUDView: View {
    @EnvironmentObject private var gameState: GameState
    @EnvironmentObject private var levelManager: LevelManager

    var body: some View {
        GeometryReader { geometry in
            let metrics = HUDLayoutMetrics(containerSize: geometry.size)
            ZStack(alignment: .top) {
                RetroHUDBar(metrics: metrics)
                    .environmentObject(gameState)
                    .environmentObject(levelManager)
                if let overlay = gameState.overlayMessage {
                    RetroOverlayBanner(text: overlay, metrics: metrics)
                        .position(x: geometry.size.width / 2,
                                  y: geometry.size.height - metrics.overlayBottomInset - metrics.overlaySize.height / 2)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .allowsHitTesting(false)
        }
    }
}

struct RetroHUDBar: View {
    @EnvironmentObject private var gameState: GameState
    @EnvironmentObject private var levelManager: LevelManager

    let metrics: HUDLayoutMetrics

    var body: some View {
        GeometryReader { geometry in
            let scoreFrame = metrics.frame(for: HUDLayoutMetrics.elements[0])
            let fillFrame = metrics.frame(for: HUDLayoutMetrics.elements[1])
            let livesFrame = metrics.frame(for: HUDLayoutMetrics.elements[2])
            let levelFrame = metrics.frame(for: HUDLayoutMetrics.elements[3])
            let targetFrame = metrics.frame(for: HUDLayoutMetrics.elements[4])
            let barWidth = HUDLayoutMetrics.baseResolution.width * metrics.scale

            ZStack(alignment: .topLeading) {
                RetroPanelFrame(cornerRadius: metrics.panelCornerRadius) {
                    RetroDitherPattern(intensity: 0.12)
                        .blendMode(.overlay)
                        .mask(RoundedRectangle(cornerRadius: metrics.panelCornerRadius).fill(Color.white))
                }
                .frame(width: barWidth, height: metrics.topBarHeight)
                .position(x: geometry.size.width / 2,
                          y: metrics.topBarHeight / 2 + metrics.topBarOffset.y)

                RetroInfoBlock(title: "Score", value: gameState.scoreString, frame: scoreFrame)
                RetroFillBlock(progress: gameState.capturedPercent,
                                target: levelManager.currentLevel.targetPercent,
                                frame: fillFrame)
                RetroInfoBlock(title: "Lives", value: "\(gameState.lives)", frame: livesFrame)
                RetroInfoBlock(title: "Level", value: "\(levelManager.currentLevel.id)", frame: levelFrame, compact: true)
                RetroInfoBlock(title: "Target", value: "\(Int(levelManager.currentLevel.targetPercent * 100))%", frame: targetFrame, compact: true)
            }
        }
        .frame(height: metrics.topBarHeight + metrics.topBarOffset.y * 2)
    }
}

struct RetroOverlayBanner: View {
    let text: String
    let metrics: HUDLayoutMetrics

    var body: some View {
        RetroPanelFrame(cornerRadius: metrics.panelCornerRadius, pressed: true) {
            RetroDitherPattern(intensity: 0.16)
                .blendMode(.overlay)
        }
        .frame(width: metrics.overlaySize.width, height: metrics.overlaySize.height)
        .overlay {
            Text(text)
                .font(.system(size: 18 * metrics.fontScale, weight: .semibold, design: .rounded))
                .foregroundStyle(RetroStyling.textPrimary)
        }
    }
}

struct RetroPanelFrame<Content: View>: View {
    var cornerRadius: CGFloat
    var pressed: Bool = false
    @ViewBuilder var content: () -> Content

    var body: some View {
        let panel = RetroStyling.panel
        let topColor = pressed ? panel.pressedTop : panel.baseTop
        let bottomColor = pressed ? panel.pressedBottom : panel.baseBottom

        RoundedRectangle(cornerRadius: cornerRadius)
            .fill(LinearGradient(colors: [topColor, bottomColor], startPoint: .top, endPoint: .bottom))
            .overlay(alignment: .topLeading) {
                Rectangle()
                    .fill(panel.highlight)
                    .frame(height: 1)
                    .clipShape(RoundedCornerMask(cornerRadius: cornerRadius, corners: [.topLeft, .topRight]))
            }
            .overlay(alignment: .leading) {
                Rectangle()
                    .fill(panel.highlight)
                    .frame(width: 1)
                    .clipShape(RoundedCornerMask(cornerRadius: cornerRadius, corners: [.topLeft, .bottomLeft]))
            }
            .overlay(alignment: .bottomTrailing) {
                Rectangle()
                    .fill(panel.shadow)
                    .frame(height: 1)
                    .clipShape(RoundedCornerMask(cornerRadius: cornerRadius, corners: [.bottomLeft, .bottomRight]))
            }
            .overlay(alignment: .trailing) {
                Rectangle()
                    .fill(panel.shadow)
                    .frame(width: 1)
                    .clipShape(RoundedCornerMask(cornerRadius: cornerRadius, corners: [.topRight, .bottomRight]))
            }
            .overlay(content: content)
            .compositingGroup()
            .shadow(color: panel.shadow.opacity(0.15), radius: 0, x: 0, y: snap(1))
    }
}

struct RetroInfoBlock: View {
    var title: String
    var value: String
    var frame: CGRect
    var compact: Bool = false

    var body: some View {
        RetroPanelFrame(cornerRadius: snap(4)) {
            RetroDitherPattern(intensity: 0.10)
                .blendMode(.overlay)
        }
        .frame(width: frame.size.width, height: frame.size.height)
        .position(x: frame.midX, y: frame.midY)
        .overlay {
            VStack(alignment: .leading, spacing: snap(compact ? 2 : 4)) {
                Text(title.uppercased())
                    .font(.system(size: compact ? 9 : 11, weight: .bold, design: .monospaced))
                    .foregroundStyle(RetroStyling.textSecondary)
                    .kerning(1)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text(value)
                    .font(.system(size: compact ? 14 : 18, weight: .semibold, design: .monospaced))
                    .foregroundStyle(RetroStyling.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, snap(compact ? 6 : 8))
        }
    }
}

struct RetroFillBlock: View {
    var progress: Double
    var target: Double
    var frame: CGRect

    var body: some View {
        RetroPanelFrame(cornerRadius: snap(4)) {
            RetroDitherPattern(intensity: 0.18)
                .blendMode(.overlay)
        }
        .frame(width: frame.size.width, height: frame.size.height)
        .position(x: frame.midX, y: frame.midY)
        .overlay {
            VStack(alignment: .leading, spacing: snap(6)) {
                HStack {
                    Text("Fill")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundStyle(RetroStyling.textSecondary)
                    Spacer()
                    Text(String(format: "%03d%%", Int(progress * 100)))
                        .font(.system(size: 18, weight: .bold, design: .monospaced))
                        .foregroundStyle(RetroStyling.textPrimary)
                }
                ZStack(alignment: .leading) {
                    RetroMeterBackground()
                    RetroMeterForeground(progress: progress)
                }
                Text("Target \(Int(target * 100))%")
                    .font(.system(size: 10, weight: .medium, design: .monospaced))
                    .foregroundStyle(RetroStyling.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
            .padding(.horizontal, snap(10))
        }
    }
}

struct RetroMeterBackground: View {
    var body: some View {
        RoundedRectangle(cornerRadius: snap(3))
            .strokeBorder(RetroStyling.panel.shadow.opacity(0.45), lineWidth: 1)
            .background(
                RoundedRectangle(cornerRadius: snap(3))
                    .fill(LinearGradient(colors: [RetroStyling.panel.baseTop, RetroStyling.panel.baseBottom], startPoint: .top, endPoint: .bottom))
            )
            .overlay {
                RetroDitherPattern(intensity: 0.22)
                    .blendMode(.overlay)
                    .clipShape(RoundedRectangle(cornerRadius: snap(3)))
            }
            .frame(height: snap(18))
    }
}

struct RetroMeterForeground: View {
    var progress: Double

    var clampedProgress: Double {
        min(max(progress, 0), 1)
    }

    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width * clampedProgress
            RoundedRectangle(cornerRadius: snap(2))
                .fill(LinearGradient(colors: [RetroStyling.accent, RetroStyling.accent.opacity(0.7)], startPoint: .top, endPoint: .bottom))
                .frame(width: max(width, snap(2)))
                .overlay(alignment: .trailing) {
                    Rectangle()
                        .fill(Color.white.opacity(0.35))
                        .frame(width: snap(1))
                }
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(Color.white.opacity(0.25))
                        .frame(height: snap(1))
                }
                .overlay(alignment: .bottom) {
                    Rectangle()
                        .fill(Color.black.opacity(0.25))
                        .frame(height: snap(1))
                }
                .offset(x: 0, y: snap(1))
        }
        .frame(height: snap(18))
    }
}

struct RetroDitherPattern: View {
    var intensity: Double

    var body: some View {
        GeometryReader { geometry in
            Canvas { context, size in
                let step = max(2.0, floor(size.width / 64))
                for y in stride(from: 0, to: size.height, by: step) {
                    for x in stride(from: 0, to: size.width, by: step) {
                        let hash = UInt64(x * 131 + y * 197) & 0xFF
                        let normalized = Double(hash) / 255.0
                        if normalized < intensity { continue }
                        let rect = CGRect(x: x, y: y, width: step, height: step)
                        let color = normalized > 0.66 ? RetroStyling.panel.textureBright : RetroStyling.panel.textureDark
                        context.fill(Path(rect), with: .color(color.opacity(0.24)))
                    }
                }
            }
        }
    }
}

struct RoundedCornerMask: Shape {
    var cornerRadius: CGFloat
    var corners: RetroRectCorner

    func path(in rect: CGRect) -> Path {
#if canImport(UIKit)
        let bezier = UIBezierPath(roundedRect: rect,
                                  byRoundingCorners: corners,
                                  cornerRadii: CGSize(width: cornerRadius, height: cornerRadius))
        return Path(bezier.cgPath)
#else
        var path = Path()
        let tl = corners.contains(.topLeft) ? cornerRadius : 0
        let tr = corners.contains(.topRight) ? cornerRadius : 0
        let bl = corners.contains(.bottomLeft) ? cornerRadius : 0
        let br = corners.contains(.bottomRight) ? cornerRadius : 0

        path.move(to: CGPoint(x: rect.minX + tl, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - tr, y: rect.minY))
        if tr > 0 {
            path.addArc(center: CGPoint(x: rect.maxX - tr, y: rect.minY + tr),
                        radius: tr,
                        startAngle: .degrees(-90),
                        endAngle: .degrees(0),
                        clockwise: false)
        } else {
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        }

        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - br))
        if br > 0 {
            path.addArc(center: CGPoint(x: rect.maxX - br, y: rect.maxY - br),
                        radius: br,
                        startAngle: .degrees(0),
                        endAngle: .degrees(90),
                        clockwise: false)
        } else {
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        }

        path.addLine(to: CGPoint(x: rect.minX + bl, y: rect.maxY))
        if bl > 0 {
            path.addArc(center: CGPoint(x: rect.minX + bl, y: rect.maxY - bl),
                        radius: bl,
                        startAngle: .degrees(90),
                        endAngle: .degrees(180),
                        clockwise: false)
        } else {
            path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        }

        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + tl))
        if tl > 0 {
            path.addArc(center: CGPoint(x: rect.minX + tl, y: rect.minY + tl),
                        radius: tl,
                        startAngle: .degrees(180),
                        endAngle: .degrees(270),
                        clockwise: false)
        } else {
            path.addLine(to: CGPoint(x: rect.minX, y: rect.minY))
        }

        path.closeSubpath()
        return path
#endif
    }
}

@inline(__always) func snap(_ value: CGFloat) -> CGFloat {
    CGFloat(Int(round(value)))
}

@inline(__always) func snap(_ value: Double) -> CGFloat {
    snap(CGFloat(value))
}

@inline(__always) func snap(_ value: Int) -> CGFloat {
    snap(CGFloat(value))
}

extension GameState {
    var scoreString: String {
        String(format: "%08d", score)
    }
}
