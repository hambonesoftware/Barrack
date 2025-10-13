#include <metal_stdlib>
using namespace metal;

struct VertexOut {
    float4 position [[position]];
    float2 texCoord;
};

fragment half4 pulseGlow(VertexOut in [[stage_in]], constant float &strength [[buffer(0)]]) {
    float dist = length(in.texCoord - float2(0.5));
    float glow = smoothstep(0.6, 0.0, dist);
    return half4(glow * strength, glow * strength * 0.6, glow * strength * 1.2, glow);
}
