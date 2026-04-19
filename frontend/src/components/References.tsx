import { List, Paper, Title } from '@mantine/core'

const REFS: Array<{ key: string; text: string; url?: string }> = [
  {
    key: 'testud2001',
    text:
      'Testud, J., S. Oury, R. A. Black, P. Amayenc, and X. Dou, 2001: The concept of "normalized" distribution to describe raindrop spectra — A tool for cloud physics and cloud remote sensing. J. Appl. Meteor., 40, 1118–1140.',
    url: 'https://doi.org/10.1175/1520-0450(2001)040%3C1118:TCONDT%3E2.0.CO;2',
  },
  {
    key: 'bringi2003',
    text:
      'Bringi, V. N., V. Chandrasekar, J. Hubbert, E. Gorgucci, W. L. Randeu, and M. Schönhuber, 2003: Raindrop size distribution in different climatic regimes from disdrometer and dual-polarized radar analysis. J. Atmos. Sci., 60, 354–365.',
    url: 'https://doi.org/10.1175/1520-0469(2003)060%3C0354:RSDIDC%3E2.0.CO;2',
  },
  {
    key: 'thurai2007',
    text:
      'Thurai, M., G. J. Huang, V. N. Bringi, W. L. Randeu, and M. Schönhuber, 2007: Drop shape representation for the retrieval of rainfall parameters. J. Atmos. Oceanic Technol., 24, 1019–1032.',
    url: 'https://doi.org/10.1175/JTECH2051.1',
  },
  {
    key: 'brandes2007',
    text:
      'Brandes, E. A., K. Ikeda, G. Zhang, M. Schönhuber, and R. M. Rasmussen, 2007: A statistical and physical description of hydrometeor distributions in Colorado snowstorms using a video disdrometer. J. Appl. Meteor. Climatol., 46, 634–650.',
    url: 'https://doi.org/10.1175/JAM2489.1',
  },
  {
    key: 'heymsfield2007',
    text:
      'Heymsfield, A. J., A. Bansemer, and C. H. Twohy, 2007: Refinements to ice particle mass dimensional and terminal velocity relationships for ice clouds. Part I: Temperature dependence. J. Atmos. Sci., 64, 1047–1067.',
    url: 'https://doi.org/10.1175/JAS3890.1',
  },
  {
    key: 'heymsfield2008',
    text:
      'Heymsfield, A. J., A. Bansemer, C. Schmitt, C. Twohy, and M. R. Poellot, 2008: Exponential size distributions for snow. J. Atmos. Sci., 65, 4017–4031.',
    url: 'https://doi.org/10.1175/2008JAS2583.1',
  },
  {
    key: 'borque2019',
    text:
      'Borque, P., K. J. Harnos, S. W. Nesbitt, and G. M. McFarquhar, 2019: Improved parameterization of ice particle size distributions using uncorrelated mass spectrum parameters: Results from GCPEx. J. Appl. Meteor. Climatol., 58, 1657–1676.',
    url: 'https://doi.org/10.1175/JAMC-D-18-0203.1',
  },
  {
    key: 'honeyager2013',
    text:
      'Honeyager, R., 2013: Investigating the use of the T-matrix method as a proxy for the discrete dipole approximation for snowflake scattering computations. M.S. thesis, Florida State University.',
    url: 'https://repository.lib.fsu.edu/islandora/object/fsu:183759',
  },
  {
    key: 'liu2004',
    text:
      'Liu, G., 2004: Approximation of single scattering properties of ice and snow particles for high microwave frequencies. J. Atmos. Sci., 61, 2441–2456.',
    url: 'https://doi.org/10.1175/1520-0469(2004)061%3C2441:AOSSPO%3E2.0.CO;2',
  },
  {
    key: 'liu2008',
    text:
      'Liu, G., 2008: A database of microwave single-scattering properties for nonspherical ice particles. Bull. Amer. Meteor. Soc., 89, 1563–1570.',
    url: 'https://doi.org/10.1175/2008BAMS2486.1',
  },
  {
    key: 'warren2008',
    text:
      'Warren, S. G., and R. E. Brandt, 2008: Optical constants of ice from the ultraviolet to the microwave: A revised compilation. J. Geophys. Res., 113, D14220.',
    url: 'https://doi.org/10.1029/2007JD009744',
  },
  {
    key: 'garrett2012',
    text:
      'Garrett, T. J., C. Fallgatter, K. Shkurko, and D. Howlett, 2012: Fall speed measurement and high-resolution multi-angle photography of hydrometeors in free fall. Atmos. Meas. Tech., 5, 2625–2633.',
    url: 'https://doi.org/10.5194/amt-5-2625-2012',
  },
  {
    key: 'ulbrich1982',
    text:
      'Ulbrich, C. W., and D. Atlas, 1982: Hail parameter relations: A comprehensive digest. J. Appl. Meteor., 21, 22–43.',
    url: 'https://doi.org/10.1175/1520-0450(1982)021%3C0022:HPRACD%3E2.0.CO;2',
  },
  {
    key: 'cheng1983',
    text:
      'Cheng, L., and M. English, 1983: A relationship between hailstone concentration and size. J. Atmos. Sci., 40, 204–213.',
    url: 'https://doi.org/10.1175/1520-0469(1983)040%3C0204:ARBHCA%3E2.0.CO;2',
  },
  {
    key: 'ryzhkov2013',
    text:
      'Ryzhkov, A. V., M. R. Kumjian, S. M. Ganson, and P. Zhang, 2013: Polarimetric radar characteristics of melting hail. Part II: Practical implications. J. Appl. Meteor. Climatol., 52, 2871–2886.',
    url: 'https://doi.org/10.1175/JAMC-D-13-074.1',
  },
  {
    key: 'rauber2018',
    text:
      'Rauber, R. M., and S. W. Nesbitt, 2018: Radar Meteorology: A First Course. Wiley, 486 pp.',
    url: 'https://onlinelibrary.wiley.com/doi/book/10.1002/9781118432662',
  },
]

export function References() {
  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Title order={4} mb="xs">
        References
      </Title>
      <List size="xs" spacing={6}>
        {REFS.map((r) => (
          <List.Item key={r.key}>
            {r.url ? (
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'inherit' }}
              >
                {r.text}
              </a>
            ) : (
              r.text
            )}
          </List.Item>
        ))}
      </List>
    </Paper>
  )
}
