import { Component } from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import { FormControl } from '@mui/material';

function VPTableFunction(props) {
  const vps = props.vps;

  return (
    <Container maxWidth="lg">
    <TableContainer component={Paper}>
      <Table stickyHeader sx={{ minWidth: 650 }} aria-label="vp-table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Email</TableCell>
            <TableCell align="center">Email Sent?</TableCell>
            <TableCell align="center">Invitation Status</TableCell>
            <TableCell align="center">Resend Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vps.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center"><Checkbox disabled checked={row.emailSent}/></TableCell>
              <TableCell align="center">{row.invitationStatus || "PENDING"}</TableCell>
              <TableCell align="center"><Button variant="contained" id={row.email} onClick={props.resendEmail}>Resend email</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  )
}

function AddVPFormFunction(props) {
  return (
    <Container>
     <form onSubmit={props.onSubmit}>
     <FormControl>
      <div id='holder' container= "flex" align-items="center" justify-content="center">
          <TextField required id="name" margin="normal" label="Name" onChange={props.nameChange}/>
          <TextField required id="email" margin="normal" label="Email" type="email" onChange={props.emailChange}/>
          <Button variant="contained" type="submit" size="large">AddVP</Button>
      </div>
      </FormControl>
     </form>
    </Container>

  )
}

class VpSite extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vps: [],
      nameSearch: '',
      emailSearch: '',
      reload: false,
    };

    this.getVps = this.getVps.bind(this);
    this.createVpObject = this.createVpObject.bind(this);
    this.addVp = this.addVp.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.resendEmail = this.resendEmail.bind(this);

    this.getVps();
  }

  getVps() {
    console.log('here');
    fetch('https://vpapi.distortionaladdict.com/vp')
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          vps: data.map((vp) => this.createVpObject(vp)),
        });
      })
      .catch((err) => {
        console.error(err);
      })
  }

  nameChange(props) {
    console.log(props.target.value)
    this.setState({
      nameSearch: props.target.value,
    });
  }

  emailChange(props) {
    console.log(props.target.value)
    this.setState({
      emailSearch: props.target.value,
    });
  }

  addVp(props) {
    props.preventDefault();

    const vp = {
      name: this.state.nameSearch,
      email: this.state.emailSearch,
    };

    fetch('https://vpapi.distortionaladdict.com/vp', {
      method: 'PUT',
      body: JSON.stringify(vp)
    })
    .then((resp) => {
      if(resp.status !== 200) {
        throw new Error(resp.statusText)
      }

      this.setState({
        nameSearch: '',
        emailSearch: '',
        reload: true,
      })
    })
    .catch((err) => {
      alert('Error saving VP. Please try again!')
      console.error(err);
    })
  }

  createVpObject(data) {
    return {
      name: data.name,
      email: data.email,
      emailSent: data.emailSent,
      invitationStatus: data.invitationStatus,
    }
  }

  resendEmail(props) {
    const vps = this.state.vps;

    if(!props) {
      console.error(`VP is empty!`);
      return
    }
    const email = props.target.id;

    const vp = vps.filter((vp) => vp.email === email);
    
    if(vp.length === 0) {
      console.error('No Vp found with email');
      return
    }

    fetch('https://vpapi.distortionaladdict.com/sendemail',{
      body: JSON.stringify(vp[0]),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((resp) => {
      if(resp.status !== 200) {
        throw new Error(resp)
      }

      this.setState({
        reload: true,
      });

      alert('Email Sent successfully');
    })
    .catch((err) => {
      console.error(err);
    })
  }

  componentDidUpdate() {
    const reload = this.state.reload;

    if(reload) {
      this.getVps();

      this.setState({
        reload: false,
      })
    }
  }

  render() {
    const vps = this.state.vps;
    if(vps.length !== 0) {
      return (
        <>
        <h2 align="center">VP Site</h2>
        <AddVPFormFunction onSubmit={this.addVp} nameChange={this.nameChange} emailChange={this.emailChange}/>
        <div className='result-table'>
          <VPTableFunction vps={this.state.vps} resendEmail={this.resendEmail}/>
        </div>
        </>
      );
    } else {
      return (
        <CircularProgress />
      )
    }
  }
}

export default VpSite;