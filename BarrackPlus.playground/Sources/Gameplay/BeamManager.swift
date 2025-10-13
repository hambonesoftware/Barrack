import CoreGraphics

public final class BeamManager {
    public struct Beam {
        public var start: CGPoint
        public var end: CGPoint
        public var anchored: Bool
    }

    private(set) var activeBeam: Beam?

    public init() {}

    public func beginBeam(at point: CGPoint) {
        activeBeam = Beam(start: point, end: point, anchored: false)
    }

    public func updateBeam(to point: CGPoint) {
        guard var beam = activeBeam else { return }
        beam.end = point
        activeBeam = beam
    }

    public func anchorBeam() {
        guard var beam = activeBeam else { return }
        beam.anchored = true
        activeBeam = beam
    }

    public func cancelBeam() {
        activeBeam = nil
    }
}
