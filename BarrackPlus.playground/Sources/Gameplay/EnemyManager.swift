import Foundation
import CoreGraphics

public final class EnemyManager {
    public struct Enemy {
        public var body: PhysicsBody
        public let kind: EnemyKind
    }

    private(set) var enemies: [Enemy] = []
    private let playBounds: CGRect

    public init(bounds: CGRect) {
        self.playBounds = bounds
    }

    public func spawn(from level: Level) {
        enemies.removeAll()
        var generator = SeededGenerator(seed: UInt64(level.seed))
        for enemy in level.enemies {
            for _ in 0..<enemy.count {
                let position = CGPoint(x: Double.random(in: playBounds.minX...playBounds.maxX, using: &generator),
                                       y: Double.random(in: playBounds.minY...playBounds.maxY, using: &generator))
                let speedRange = enemy.speed
                let dx = Double.random(in: speedRange[0]...speedRange[1], using: &generator) * (Bool.random(using: &generator) ? 1 : -1)
                let dy = Double.random(in: speedRange[0]...speedRange[1], using: &generator) * (Bool.random(using: &generator) ? 1 : -1)
                let body = PhysicsBody(position: position, velocity: CGVector(dx: dx, dy: dy), radius: 12)
                enemies.append(Enemy(body: body, kind: enemy.type))
            }
        }
    }

    public func step(deltaTime: CGFloat) {
        for index in enemies.indices {
            Physics.step(body: &enemies[index].body, in: playBounds, deltaTime: deltaTime)
        }
    }
}
