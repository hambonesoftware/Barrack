import CoreGraphics

public struct PhysicsBody {
    public var position: CGPoint
    public var velocity: CGVector
    public var radius: CGFloat

    public init(position: CGPoint, velocity: CGVector, radius: CGFloat) {
        self.position = position
        self.velocity = velocity
        self.radius = radius
    }
}

public enum Physics {
    public static func step(body: inout PhysicsBody, in bounds: CGRect, deltaTime: CGFloat) {
        let proposed = CGPoint(x: body.position.x + body.velocity.dx * deltaTime,
                               y: body.position.y + body.velocity.dy * deltaTime)

        var velocity = body.velocity
        var position = proposed

        if proposed.x - body.radius < bounds.minX || proposed.x + body.radius > bounds.maxX {
            velocity.dx *= -1
            position.x = max(bounds.minX + body.radius, min(bounds.maxX - body.radius, position.x))
        }
        if proposed.y - body.radius < bounds.minY || proposed.y + body.radius > bounds.maxY {
            velocity.dy *= -1
            position.y = max(bounds.minY + body.radius, min(bounds.maxY - body.radius, position.y))
        }

        body.position = position
        body.velocity = velocity
    }

    public static func reflect(velocity: CGVector, normal: CGVector) -> CGVector {
        let normalised = normal.normalized
        let dot = velocity.dx * normalised.dx + velocity.dy * normalised.dy
        let reflected = CGVector(dx: velocity.dx - 2 * dot * normalised.dx,
                                 dy: velocity.dy - 2 * dot * normalised.dy)
        return reflected
    }
}

private extension CGVector {
    var normalized: CGVector {
        let length = sqrt(dx * dx + dy * dy)
        guard length > 0 else { return CGVector(dx: 0, dy: 0) }
        return CGVector(dx: dx / length, dy: dy / length)
    }
}
