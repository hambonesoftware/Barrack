import SpriteKit

public enum Effects {
    public static func captureBurst(at position: CGPoint) -> SKEmitterNode {
        let emitter = SKEmitterNode()
        emitter.particleTexture = SKTexture(imageNamed: "spark")
        emitter.particleBirthRate = 200
        emitter.numParticlesToEmit = 80
        emitter.particleLifetime = 0.6
        emitter.particleColorSequence = nil
        emitter.particleColor = ColorPalette.active.primary.uiColor
        emitter.particleSpeed = 150
        emitter.particleSpeedRange = 120
        emitter.particleAlphaSpeed = -1.5
        emitter.position = position
        return emitter
    }
}
