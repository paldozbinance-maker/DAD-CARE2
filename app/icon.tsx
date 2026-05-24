import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
                    borderRadius: '40px',
                }}
            >
                {/* Dad figure - head */}
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'white',
                        marginBottom: '-5px',
                    }}
                />
                {/* Dad figure - body */}
                <div
                    style={{
                        width: '50px',
                        height: '45px',
                        background: 'white',
                        borderRadius: '8px 8px 4px 4px',
                        marginBottom: '4px',
                    }}
                />
                {/* Scale bar */}
                <div
                    style={{
                        width: '110px',
                        height: '5px',
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '3px',
                        marginBottom: '2px',
                    }}
                />
                {/* Scale plates container */}
                <div style={{ display: 'flex', gap: '50px' }}>
                    <div
                        style={{
                            width: '30px',
                            height: '20px',
                            background: 'rgba(255,255,255,0.8)',
                            borderRadius: '0 0 6px 6px',
                        }}
                    />
                    <div
                        style={{
                            width: '30px',
                            height: '20px',
                            background: 'rgba(255,255,255,0.8)',
                            borderRadius: '0 0 6px 6px',
                        }}
                    />
                </div>
                {/* KG Text */}
                <div
                    style={{
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 900,
                        letterSpacing: '4px',
                        marginTop: '6px',
                    }}
                >
                    KG
                </div>
            </div>
        ),
        { ...size }
    );
}
