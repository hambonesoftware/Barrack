import SwiftUI

public struct PaletteEntry: Codable {
    public let id: String
    public let primary: String
    public let secondary: String
    public let background: String
}

public struct ColorPalette {
    public struct Scheme {
        public let primary: Color
        public let secondary: Color
        public let background: Color

        #if canImport(UIKit)
        public var uiColor: UIColor { UIColor(primary) }
        #else
        public var uiColor: Color { primary }
        #endif
    }

    public enum Kind: String, CaseIterable, Codable {
        case `default`
        case tritan
        case protan

        public var displayName: String {
            rawValue.capitalized
        }
    }

    public static var active: Scheme {
        let selected = UserDefaults.standard.string(forKey: "selectedPalette") ?? Kind.default.rawValue
        let palette = loadPalettes()[selected] ?? loadPalettes()[Kind.default.rawValue]!
        return Scheme(primary: Color(hex: palette.primary),
                      secondary: Color(hex: palette.secondary),
                      background: Color(hex: palette.background))
    }

    private static func loadPalettes() -> [String: PaletteEntry] {
        guard
            let url = Bundle.main.url(forResource: "palettes", withExtension: "json"),
            let data = try? Data(contentsOf: url),
            let decoded = try? JSONDecoder().decode([PaletteEntry].self, from: data)
        else {
            return [
                "default": PaletteEntry(id: "default", primary: "#FFFFFF", secondary: "#CCCCCC", background: "#000000")
            ]
        }
        return Dictionary(uniqueKeysWithValues: decoded.map { ($0.id, $0) })
    }
}

private extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted))
        var int: UInt64 = 0
        scanner.scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 255, 255, 255)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}
