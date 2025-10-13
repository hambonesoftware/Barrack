import Foundation
import SpriteKit

public final class GameState: ObservableObject {
    @Published public private(set) var capturedPercent: Double = 0
    @Published public private(set) var lives: Int = 3
    @Published public private(set) var overlayMessage: String?
    @Published public private(set) var score: Int = 0

    public private(set) var currentLevel: Level = Level.demo
    public private(set) var isWin: Bool = false
    public private(set) var isLose: Bool = false

    public let scene = GameScene(size: CGSize(width: 1024, height: 768))
    private lazy var progressMeter = ProgressMeter(gameState: self)
    private var lastCapturedPercent: Double = 0

    public init() {
        scene.scaleMode = .resizeFill
        scene.gameState = self
    }

    public func configure(with level: Level) {
        currentLevel = level
        lives = level.lives
        capturedPercent = 0
        lastCapturedPercent = 0
        score = 0
        isWin = false
        isLose = false
        overlayMessage = "Capture \(Int(level.targetPercent * 100))%"
        scene.configure(level: level)
    }

    public func reportCapture(count: Int, total: Int) {
        let updatedPercent = progressMeter.capturePercent(capturedCells: count, totalCells: total)
        let delta = max(0, updatedPercent - lastCapturedPercent)
        if delta > 0 {
            score += Int((delta * 1000).rounded())
            lastCapturedPercent = updatedPercent
        }
        capturedPercent = updatedPercent
        checkWinLoseConditions()
    }

    public func loseLife() {
        lives -= 1
        if lives <= 0 {
            triggerLose()
        }
    }

    public func step(deltaTime: TimeInterval) {
        scene.step(deltaTime: deltaTime)
    }

    public func checkWinLoseConditions() {
        if capturedPercent >= currentLevel.targetPercent {
            triggerWin()
        } else if lives <= 0 {
            triggerLose()
        } else if currentLevel.hasTimer && currentLevel.remainingTime <= 0 {
            triggerLose()
        }
    }

    private func triggerWin() {
        guard !isWin else { return }
        isWin = true
        overlayMessage = "Level Complete"
    }

    private func triggerLose() {
        guard !isLose else { return }
        isLose = true
        overlayMessage = "Try Again"
    }
}
