import Foundation
import CoreGraphics

public enum PowerupKind: String, Codable {
    case slowMo = "Slow-Mo"
    case shield = "Shield"
    case multiSeed = "Multi-Seed"
}

public struct Powerup {
    public let kind: PowerupKind
    public var remaining: TimeInterval
}

public final class PowerupManager: ObservableObject {
    @Published public private(set) var activePowerups: [PowerupKind: Powerup] = [:]

    public init() {}

    public func tick(deltaTime: TimeInterval) {
        for (kind, powerup) in activePowerups {
            var updated = powerup
            updated.remaining -= deltaTime
            if updated.remaining <= 0 {
                activePowerups.removeValue(forKey: kind)
            } else {
                activePowerups[kind] = updated
            }
        }
    }

    public func activate(_ kind: PowerupKind, duration: TimeInterval) {
        activePowerups[kind] = Powerup(kind: kind, remaining: duration)
    }
}
