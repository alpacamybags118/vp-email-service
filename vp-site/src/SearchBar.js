import { Component } from 'react'
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = props.data

    this.typeEvent = this.typeEvent.bind(this);
  }

  typeEvent(event) {
    let stateCopy = this.state;

    stateCopy.searchText = event.target.value
    this.setState(stateCopy);  
  }

  render() {
    return (
      <form onSubmit={this.props.search}>
        <Container maxWidth="md">
          <TextField label="Search Here" id="search" value={this.state.searchText} onChange={this.typeEvent} />
        </Container>
      </form>
    )
  }
}

export default SearchBar;