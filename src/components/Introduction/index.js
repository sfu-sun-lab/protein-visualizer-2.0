import React from 'react';
import {
  Card,
  CardActions,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  Link
} from '@material-ui/core';
import Logo from '../../static/sunlab.png';
import './index.scss';

function Introduction(props) {
  const title = 'Protein Visualizer';

  const redirect = () => {
    window.location.href = 'http://www.sfu.ca/chemistry/groups/bingyun_sun/';
  };

  return (
    <div>
      <Card className="introduction--wrapper">
        <CardActionArea>
          <CardMedia
            component="img"
            alt="lab logo"
            // height="120"
            image={Logo}
            className="introduction--logo"
            onClick={redirect}
          />
        </CardActionArea>
        <CardContent className="introduction--body">
          <Typography variant="h5" className="introduction--title">
            Protein Visualizer 2.0
          </Typography>
          <Typography variant="body1">
            This web application visualizes protein glycosylation sites, disulfide bonds, sequon sites, 
            and cysteine sites (obtained from <nbsp/>
              <Link href='https://www.uniprot.org/'>
              UniProt
              </Link>
            ) to illustrate patterns in their arrangement in relation to the protein topology.
          </Typography>
          <ul className="introduction--ul">
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
                Search for a human protein to visualize from the Uniprot database or select one of several 
                example proteins with conflicts to visualize from the drop down menu located above this card.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
              If the current scale of the visualization is not sufficient to identify patterns, a sliding scale is provided 
              on the top right of the app bar to horizontally expand the protein.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
              In addition to the sliding scale, there is a window feature for each protein that allows users to target a specific 
              region for visualization. This feature is located below the original visualization.
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
              The legend moves with the page as the user scrolls, keeping the information always within reach. Additionally, the 
              legend and each protein feature can be toggled to enhance viewability. 
              </Typography>
            </li>
            <li className="introduction--bullet">
              <Typography variant="body2" display="inline">
              An export image feature is provided, allowing users to capture publication-quality snapshots of the protein and the window. 
              </Typography>
            </li>
          </ul>
          <br/>
          <Typography variant="body1">
          Please cite following publication(s) when using the Visualizer 2.0:
          </Typography>
          <ul className="introduction--ul">
            <li className="introduction--bullet">
              <Link href='https://pubs.acs.org/doi/10.1021/acschembio.4c00485'>
                Protein Visualizer 2.0: Intuitive and Interactive Visualization of Protein Topology and Co/Post-Translational Modifications. ACS Chem. Biol. 2024, 19, 9, 1930–1934.
              </Link>
            </li>
          </ul>
          <Typography variant="body1">
            Previous Version: 
            {' '}
              <Link href='https://sfu-sun-lab.github.io/protein-visualizer/'>
                Protein Visualizer 1.0
              </Link>
          </Typography>
          <br/>
          <Typography variant="body1">
            Tutorial on how to use the visualizer 2.0: 
            {' '}
              <Link href='https://www.youtube.com/watch?v=q8QaIdRW02g'>
                Youtube
              </Link>
          </Typography>
          <br/>
          <Typography variant="body1">
          For further information, contact Dr. Bingyun Sun: bingyun_sun@sfu.ca
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default Introduction;
