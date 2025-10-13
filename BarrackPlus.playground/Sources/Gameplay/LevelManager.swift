import Foundation

public struct Level: Codable, Identifiable {
    public struct Enemy: Codable {
        public let type: EnemyKind
        public let count: Int
        public let speed: [Double]
    }

    public let id: Int
    public let seed: Int
    public var targetPercent: Double
    public let enemies: [Enemy]
    public let powerupRate: Double
    public var lives: Int = 3
    public var hasTimer: Bool = false
    public var remainingTime: TimeInterval = 0

    public static let demo = Level(id: 0, seed: 0, targetPercent: 0.7, enemies: [], powerupRate: 0)
}

enum EnemyKind: String, Codable {
    case bouncer = "Bouncer"
    case ricochet = "Ricochet"
    case splitter = "Splitter"
    case drifter = "Drifter"
}

public final class LevelManager: ObservableObject {
    @Published public private(set) var levels: [Level] = []
    @Published public private(set) var currentLevelIndex: Int = 0

    public init() {
        loadLevels()
    }

    public var currentLevel: Level {
        guard currentLevelIndex < levels.count else { return .demo }
        return levels[currentLevelIndex]
    }

    public func advance() {
        if currentLevelIndex + 1 < levels.count {
            currentLevelIndex += 1
        }
    }

    public func reset() {
        currentLevelIndex = 0
    }

    private func loadLevels() {
        guard
            let url = Bundle.main.url(forResource: "levels", withExtension: "json"),
            let data = try? Data(contentsOf: url),
            let decoded = try? JSONDecoder().decode([Level].self, from: data)
        else {
            levels = [Level.demo]
            return
        }
        levels = decoded
    }
}
