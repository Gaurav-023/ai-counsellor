import { Box, Typography, keyframes, useTheme, useMediaQuery } from '@mui/material';

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const countries = [
    { name: 'USA', logo: 'https://flagcdn.com/w80/us.png' },
    { name: 'UK', logo: 'https://flagcdn.com/w80/gb.png' },
    { name: 'Canada', logo: 'https://flagcdn.com/w80/ca.png' },
    { name: 'Australia', logo: 'https://flagcdn.com/w80/au.png' },
    { name: 'Germany', logo: 'https://flagcdn.com/w80/de.png' },
    { name: 'Ireland', logo: 'https://flagcdn.com/w80/ie.png' },
    { name: 'France', logo: 'https://flagcdn.com/w80/fr.png' },
    { name: 'Japan', logo: 'https://flagcdn.com/w80/jp.png' },

    // duplicates for seamless loop
    { name: 'USA', logo: 'https://flagcdn.com/w80/us.png' },
    { name: 'UK', logo: 'https://flagcdn.com/w80/gb.png' },
    { name: 'Canada', logo: 'https://flagcdn.com/w80/ca.png' },
    { name: 'Australia', logo: 'https://flagcdn.com/w80/au.png' },
    { name: 'Germany', logo: 'https://flagcdn.com/w80/de.png' },
    { name: 'Ireland', logo: 'https://flagcdn.com/w80/ie.png' },
    { name: 'France', logo: 'https://flagcdn.com/w80/fr.png' },
    { name: 'Japan', logo: 'https://flagcdn.com/w80/jp.png' },
];

const LogoMarquee = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const animationDuration = isMobile ? '20s' : '36s';

    return (
        <Box
            sx={{
                py: { xs: 4, md: 6 },
                bgcolor: '#ffffff',
                overflow: 'hidden',
                position: 'relative',
                borderBottom: '1px solid #E5E7EB',
            }}
        >
            {/* Fade edges */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(90deg, #ffffff 0%, transparent 15%, transparent 85%, #ffffff 100%)',
                }}
            />

            <Typography
                variant="caption"
                align="center"
                display="block"
                sx={{
                    mb: 4,
                    color: '#111827',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                }}
            >
                Trusted by students targeting top universities in
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    gap: { xs: 6, md: 10 },
                    width: 'max-content',
                    animation: `${scroll} ${animationDuration} linear infinite`,
                    willChange: 'transform',

                    '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                    },
                }}
            >
                {countries.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            opacity: 0.9,
                            transition: 'transform 0.25s ease',
                            '&:hover': {
                                transform: 'scale(1.08)',
                            },
                        }}
                    >
                        <Box
                            component="img"
                            src={item.logo}
                            alt={item.name}
                            loading="lazy"
                            sx={{
                                width: { xs: 48, md: 64 },
                                height: 'auto',
                                borderRadius: 1,
                                boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                            }}
                        />

                        <Typography
                            variant="body1"
                            fontWeight={700}
                            sx={{
                                color: '#111827',
                                whiteSpace: 'nowrap',
                                fontSize: { xs: '0.95rem', md: '1.05rem' },
                            }}
                        >
                            {item.name}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default LogoMarquee;
